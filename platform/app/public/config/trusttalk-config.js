window.config = {
  // 1. Core Deployment Settings
  routerBasename: '/',
  showStudyList: false, // Launched directly via URL; no worklist needed.
  maxNumberOfWebWorkers: 4,
  strictZSpacingForVolumeViewport: true,
  showLoadingIndicator: true,
  showWarningMessageForCrossOrigin: true,
  showCPUFallbackMessage: true,

  // 2. Request Throttling & Pre-fetching
  maxNumRequests: {
    interaction: 100,
    thumbnail: 75,
    prefetch: 25,
  },
  studyPrefetcher: {
    enabled: true,
    displaySetsCount: 2,
    maxNumPrefetchRequests: 10,
    order: 'closest',
  },
  httpErrorHandler: error => {
    console.warn('HTTP error handled by TrustTalk error handler:', error);
  },

  // 3. Extensions (Full Diagnostic & Advanced Modalities Suite)
  extensions: [
    '@ohif/extension-default',
    '@ohif/extension-cornerstone',
    '@ohif/extension-measurement-tracking',
    '@ohif/extension-cornerstone-dicom-sr',
    '@ohif/extension-cornerstone-dicom-seg',
    '@ohif/extension-cornerstone-dicom-rt',
    '@ohif/extension-cornerstone-dicom-pmap',
    '@ohif/extension-tmtv',
    '@ohif/extension-dicom-pdf',
    '@ohif/extension-dicom-video',
  ],

  // 4. Modes (Workspaces)
  modes: [
    '@ohif/mode-longitudinal',
    '@ohif/mode-basic',
    '@ohif/mode-segmentation',
    '@ohif/mode-tmtv',
    '@ohif/mode-microscopy',
  ],

  // 5. Data Source: JSON File (Serverless Presigned Manifest)
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomjson',
      sourceName: 'dicomjson',
      configuration: {
        friendlyName: 'JSON File Source',
        name: 'json',
        dangerouslyAllowedOriginsForAuthenticatedEnvironments: [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:5000',
          'https://staging-storeapi.trusttalk.net',
          'https://storeapi.trusttalk.net',
        ],
      },
    },
  ],
  defaultDataSourceName: 'dicomjson',

  // 6. TrustTalk Custom Branding
  whiteLabeling: {
    createLogoComponentFn: function (React) {
      return React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            padding: '10px 20px',
            fontFamily: 'Arial, sans-serif',
          },
        },
        [
          React.createElement('img', {
            key: 'logo-img',
            src: '/trusttalk-logo.png',
            alt: 'TrustTalk',
            style: {
              height: '40px',
              marginRight: '12px',
            },
            onError: function (e) {
              e.target.style.display = 'none';
            },
          }),
          React.createElement('span', { key: 'logo-text' }, 'TrustTalk'),
        ]
      );
    },
  },

  // 7. Custom Hotkeys
  hotkeys: [
    { commandName: 'incrementActiveViewport', label: 'Next Viewport', keys: ['right'] },
    { commandName: 'decrementActiveViewport', label: 'Previous Viewport', keys: ['left'] },
    { commandName: 'flipViewportHorizontal', label: 'Flip Horizontally', keys: ['h'] },
    { commandName: 'flipViewportVertical', label: 'Flip Vertically', keys: ['v'] },
    { commandName: 'rotateViewportCW', label: 'Rotate Right', keys: ['r'] },
    { commandName: 'rotateViewportCCW', label: 'Rotate Left', keys: ['l'] },
    { commandName: 'invertViewport', label: 'Invert', keys: ['i'] },
    { commandName: 'scaleUpViewport', label: 'Zoom In', keys: ['+'] },
    { commandName: 'scaleDownViewport', label: 'Zoom Out', keys: ['-'] },
    { commandName: 'resetViewport', label: 'Reset', keys: ['space'] },
  ],

  // 8. Viewport Overlays (Standard Diagnostic 4-Corner Setup)
  customizationService: {
    'viewportOverlay.topLeft': [
      {
        id: 'PatientName',
        inheritsFrom: 'ohif.overlayItem',
        condition: ({ referenceInstance }) => referenceInstance?.PatientName,
        contentF: ({ referenceInstance, formatters: { formatPN } }) =>
          formatPN(referenceInstance.PatientName),
      },
      {
        id: 'PatientID',
        inheritsFrom: 'ohif.overlayItem',
        condition: ({ referenceInstance }) => referenceInstance?.PatientID,
        contentF: ({ referenceInstance }) => referenceInstance.PatientID,
      },
      {
        id: 'StudyDate',
        inheritsFrom: 'ohif.overlayItem',
        condition: ({ referenceInstance }) => referenceInstance?.StudyDate,
        contentF: ({ referenceInstance, formatters: { formatDate } }) =>
          formatDate(referenceInstance.StudyDate),
      },
      {
        id: 'SeriesDescription',
        inheritsFrom: 'ohif.overlayItem',
        condition: ({ referenceInstance }) => referenceInstance?.SeriesDescription,
        contentF: ({ referenceInstance }) => referenceInstance.SeriesDescription,
      },
    ],
    'viewportOverlay.topRight': [
      {
        id: 'StudyDescription',
        inheritsFrom: 'ohif.overlayItem',
        condition: ({ referenceInstance }) => referenceInstance?.StudyDescription,
        contentF: ({ referenceInstance }) => referenceInstance.StudyDescription,
      },
      {
        id: 'Modality',
        inheritsFrom: 'ohif.overlayItem',
        condition: ({ referenceInstance }) => referenceInstance?.Modality,
        contentF: ({ referenceInstance }) => referenceInstance.Modality,
      },
    ],
    'viewportOverlay.bottomLeft': [
      {
        id: 'WindowLevel',
        inheritsFrom: 'ohif.overlayItem.windowLevel',
      },
      {
        id: 'ZoomLevel',
        inheritsFrom: 'ohif.overlayItem.zoomLevel',
      },
    ],
    'viewportOverlay.bottomRight': [
      {
        id: 'InstanceNumber',
        inheritsFrom: 'ohif.overlayItem.instanceNumber',
      },
      {
        id: 'ThicknessLocation',
        inheritsFrom: 'ohif.overlayItem',
        condition: ({ referenceInstance }) =>
          referenceInstance?.SliceThickness || referenceInstance?.SliceLocation,
        contentF: ({ referenceInstance, formatters: { formatNumberPrecision } }) => {
          const parts = [];
          if (referenceInstance?.SliceThickness) {
            parts.push(`Thick: ${formatNumberPrecision(referenceInstance.SliceThickness, 2)}mm`);
          }
          if (referenceInstance?.SliceLocation) {
            parts.push(`Loc: ${formatNumberPrecision(referenceInstance.SliceLocation, 2)}mm`);
          }
          return parts.join(' | ');
        },
      },
    ],
  },
};
