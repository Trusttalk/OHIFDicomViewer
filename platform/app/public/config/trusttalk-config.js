// platform/app/public/config/default.js

window.config = {
  // 1. Core Deployment Settings
  routerBasename: '/dv',
  showStudyList: false, // We launch directly via URL, so no study list needed.

  // 2. Extensions (CRITICAL for v3.9.0)
  // These provide the underlying functionality (DICOM parsing, Tools, etc.)
  // extensions: [
  //   '@ohif/extension-default',
  //   '@ohif/extension-cornerstone',
  //   '@ohif/extension-measurement-tracking',
  //   '@ohif/extension-cornerstone-dicom-sr',
  //   '@ohif/extension-dicom-pdf',
  //   '@ohif/extension-dicom-video',
  // ],

  // // 3. Modes (CRITICAL for v3.9.0)
  // // These define the actual Viewer Layout (Radiology, PET/CT, etc.)
  // modes: ['@ohif/mode-longitudinal'],

  // FIX: Leave these empty. The build system fills them automatically.
  // extensions: [],
  // modes: [],

  // 4. Data Source: JSON File (Serverless)
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomjson',
      sourceName: 'dicomjson',
      configuration: {
        friendlyName: 'JSON File Source',
        name: 'json',
      },
    },
  ],

  // This tells OHIF to use the 'dicomjson' source by default
  defaultDataSourceName: 'dicomjson',

  // 5. TrustTalk Custom Branding
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
          // Logo image
          React.createElement('img', {
            key: 'logo-img',
            src: '/dv/trusttalk-logo.png', // Ensure this file exists in public/dv/
            alt: 'TrustTalk',
            style: {
              height: '40px',
              marginRight: '12px',
            },
            onError: function (e) {
              e.target.style.display = 'none';
            },
          }),
          // Company name text
          React.createElement('span', { key: 'logo-text' }, 'TrustTalk'),
        ]
      );
    },
  },

  // 6. Custom Hotkeys
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

  // 7. UI Customization (Overlays)
  customizationService: {
    cornerstoneOverlayTopLeft: {
      id: 'cornerstoneOverlayTopLeft',
      items: [
        {
          id: 'PatientNameOverlay',
          customizationType: 'ohif.overlayItem',
          attribute: 'PatientName',
          title: 'Patient Name',
          condition: ({ instance }) => instance?.PatientName,
          contentF: ({ instance, formatters: { formatPN } }) => formatPN(instance.PatientName),
        },
        {
          id: 'PatientIDOverlay',
          customizationType: 'ohif.overlayItem',
          attribute: 'PatientID',
          title: 'Patient ID',
          condition: ({ instance }) => instance?.PatientID,
          contentF: ({ instance }) => instance.PatientID,
        },
      ],
    },
  },
};
