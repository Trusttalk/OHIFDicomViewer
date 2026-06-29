# DICOM Measurement Unit Calibration Resolution (px to mm)

This document details the root causes and technical resolutions for the issue where length and other geometry measurements in the OHIF Viewer were displayed in pixels (`px`) instead of millimeters (`mm`).

---

## Part 1: Symptoms and Initial Investigation

### Symptoms
1. **Measurement Units:** All length measurements drawn on certain projection radiographs (e.g., DX, CR) defaulted to `px`.
2. **Javascript Console Errors (Staging/Production):**
   ```
   TypeError: platform.detectOverflow is not a function
   ```
   and later:
   ```
   TypeError: Cannot read properties of undefined (reading 'displaySetInstanceUID')
       at Object.toMeasurement (Length.ts:85)
   ```
3. **Data Characteristics:** The DICOM images in question did not have the standard 3D/cross-sectional positioning attributes (`ImagePositionPatient`, `ImageOrientationPatient`) but *did* contain valid spacing attributes (`ImagerPixelSpacing` / `PixelSpacing`).

---

## Part 2: The Root Causes

We discovered **three distinct, interacting issues** that together caused the failure:

### 1. Optional Tag Invalidation (Cornerstone vs. OHIF defaults)
* **File:** [MetadataProvider.ts](file:///d:/Code/Trusttalk/OHIFDicomViewer/platform/core/src/classes/MetadataProvider.ts)
* **Mechanics:** In the `imagePlaneModule` metadata provider handler, if `ImageOrientationPatient` or `ImagePositionPatient` were missing, the provider explicitly set `usingDefaultValues = true`.
* **Impact:** Cornerstone's internal viewport logic (`StackViewport.calibrateIfNecessary`) checks `usingDefaultValues` before utilizing the pixel spacing values. If `usingDefaultValues` is `true`, it flags `hasPixelSpacing = false`, which forces the measurement tools to fall back to `px`. 
* **Correction:** Since projection radiography images (like DX/CR) are 2D and do not have patient orientation/position coordinates, we bypassed setting `usingDefaultValues = true` when orientation or position coordinates are absent, so long as valid pixel spacing information is present.

### 2. State Mutation in Metadata Retrieval
* **File:** [MetadataProvider.ts](file:///d:/Code/Trusttalk/OHIFDicomViewer/platform/core/src/classes/MetadataProvider.ts)
* **Mechanics:** The custom `_getInstance(imageId)` method was resolving the image's raw instance object from the cache and modifying it directly:
  ```javascript
  result.imageId = imageId;
  ```
* **Impact:** Modifying `result.imageId` mutated the shared instance cached inside `DicomMetadataStore`. The Cornerstone core/extension code uses a utility called `getImageId({ instance })` which prioritizes `instance.imageId` if present. Mutating this shared object caused subsequent calls of `getImageId` to return the frame-suffixed image ID (e.g., `dicomweb:https://...&frame=1`) instead of the base URL (`https://...`). This mismatch corrupted how data was mapped to lookup keys.
* **Correction:** Returned a shallow copy of the instance object (`{ ...result, imageId }`) instead of mutating the shared cache object in place.

### 3. Frame URL Key Mismatch in UID Map
* **File:** [MetadataProvider.ts](file:///d:/Code/Trusttalk/OHIFDicomViewer/platform/core/src/classes/MetadataProvider.ts)
* **Mechanics:** The DicomJSON data source registers image UIDs by calling `metadataProvider.addImageIdToUIDs(imageId, uids)`. This was called with the image's URL containing `&frame=N`. However, lookups via `getUIDsFromImageID(imageId)` always strip the `&frame=` parameter from the URL before query.
* **Impact:** Because the store retained the `&frame=N` suffix but the lookup stripped it, `_getInstance()` could never retrieve the DICOM instance object for multi-frame DicomJSON datasets. This broke the mapping for the measurement service (causing the `displaySetInstanceUID` crash) and bypassed calibration entirely.
* **Correction:** Modified `addImageIdToUIDs` to strip `&frame=` from the lookup URI prior to registering it in `imageURIToUIDs`.

---

## Part 3: Detailed Code Diffs

Here is a summary of the exact modifications made in [MetadataProvider.ts](file:///d:/Code/Trusttalk/OHIFDicomViewer/platform/core/src/classes/MetadataProvider.ts):

### 1. `addImageIdToUIDs` Frame Stripping
```diff
   addImageIdToUIDs(imageId, uids) {
     if (!imageId) {
       throw new Error('MetadataProvider::Empty imageId');
     }
 
     // This method is a fallback for when you don't have WADO-URI or WADO-RS.
     // You can add instances fetched by any method by calling addInstance, and hook an imageId to point at it here.
     // An example would be dicom hosted at some random site.
-    const imageURI = this.getURI(imageId);
+    let imageURI = this.getURI(imageId);
+    // Strip &frame=N so the key matches what getUIDsFromImageID looks up.
+    // The lookup always strips the frame, so we must store without it too.
+    imageURI = imageURI.split('&frame=')[0];
     this.imageURIToUIDs.set(imageURI, uids);
   }
```

### 2. `_getInstance` Immutability
```diff
     const result = (frameNumber && combineFrameInstance(frameNumber, instance)) || instance;
     if (result) {
-      result.imageId = imageId;
+      // Return a shallow copy so we don't mutate the shared cached instance object.
+      // Mutating result.imageId directly caused getImageId() (which checks instance.imageId first)
+      // to return a corrupted imageId, breaking addImageIdToUIDs map lookups for subsequent calls.
+      return { ...result, imageId };
     }
     return result;
```

### 3. Optional Tag Handling
```diff
     if (ImageOrientationPatient) {
       rowCosines = toNumber(ImageOrientationPatient.slice(0, 3));
       columnCosines = toNumber(ImageOrientationPatient.slice(3, 6));
       imageOrientationPatient = toNumber(ImageOrientationPatient);
     } else {
       rowCosines = [1, 0, 0];
       columnCosines = [0, 1, 0];
       imageOrientationPatient = [1, 0, 0, 0, 1, 0];
       isDefaultValueSetForRowCosine = true;
       isDefaultValueSetForColumnCosine = true;
+      // We do NOT set usingDefaultValues = true here.
+      // In projection radiography (DX, CR, PX, etc.), ImageOrientationPatient is optional.
+      // If PixelSpacing is present, we still want to use it for measurement calibration
+      // instead of invalidating it and defaulting to px.
     }
 
     const imagePositionPatient = toNumber(ImagePositionPatient) || [0, 0, 0];
     if (!ImagePositionPatient) {
-      usingDefaultValues = true;
+      // We do NOT set usingDefaultValues = true here.
+      // In projection radiography, ImagePositionPatient is optional.
+      // Having no position should not invalidate the spacing measurement unit (mm).
     }
```

---

## Part 4: Safety Assessment (Will this break other modalities?)

**1. Metadata Cache Mutation Fix (`{ ...result, imageId }`):**
* **Safety:** **Extremely Safe / Corrective.** Mutating a shared state cache is a classic anti-pattern that leads to unpredictable behavior. Returning a shallow copy guarantees that the underlying `DicomMetadataStore` cache remains pristine, ensuring other parts of the application that expect the original `instance` structure are unaffected.

**2. Frame parameter stripping in `addImageIdToUIDs`:**
* **Safety:** **Safe.** `getUIDsFromImageID` *always* strips `&frame=` before querying this map. Keeping the keys consistent with the query key is the only way lookups for multi-frame files can succeed. It has no negative impact on single-frame studies because their URIs do not contain `&frame=`.

**3. Bypassing `usingDefaultValues = true` for missing orientation/position:**
* **Safety:** **Safe.** 
  * For **3D volumes** (CT/MR): The DICOM standard mandates `ImageOrientationPatient` and `ImagePositionPatient`. If they are missing, the volume cannot be reconstructed anyway.
  * For **Ultrasounds (US):** Ultrasound relies on `SequenceOfUltrasoundRegions` for calibration, which goes through different code paths under Cornerstone (`calibratedPixelSpacingMetadataProvider`).
  * For **2D radiographs (DX/CR/MG):** This is precisely where these tags are optional, but `ImagerPixelSpacing` is correct and must be honored. This change correctly allows 2D radiographs with valid spacing to be measured in millimeters instead of defaulting to pixels.
