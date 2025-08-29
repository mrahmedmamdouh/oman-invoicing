export const getOmanTheme = (isRTL = true) => ({
  token: {
    // Oman national colors and branding
    colorPrimary: '#C8102E', // Oman red
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // Typography
    fontFamily: isRTL 
      ? '"Noto Sans Arabic", "Arial", sans-serif' 
      : '"Segoe UI", "Roboto", "Arial", sans-serif',
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    
    // Layout
    borderRadius: 6,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    
    // Colors for light theme
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
    colorBgElevated: '#ffffff',
    
    // Custom tokens for Oman specific features
    colorOmanGreen: '#009639', // Complement to red
    colorOmanGold: '#FFD700', // For special highlighting
  },
  
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      siderBg: '#001529',
      bodyBg: '#f5f5f5',
    },
    
    Menu: {
      itemBg: 'transparent',
      itemColor: 'rgba(255, 255, 255, 0.65)',
      itemHoverColor: '#ffffff',
      itemSelectedColor: '#ffffff',
      itemSelectedBg: '#C8102E',
    },
    
    Table: {
      headerBg: '#fafafa',
      rowHoverBg: '#f5f5f5',
    },
    
    Form: {
      labelRequiredMarkColor: '#C8102E',
      itemMarginBottom: 24,
    },
    
    Button: {
      primaryShadow: '0 2px 0 rgba(200, 16, 46, 0.1)',
    },
    
    Input: {
      paddingBlock: 8,
      paddingInline: 12,
    },
    
    // RTL specific adjustments
    ...(isRTL && {
      Select: {
        selectorBg: '#ffffff',
      },
      DatePicker: {
        cellBg: '#ffffff',
      },
    }),
  },
  
  // Algorithm for dark mode support (future enhancement)
  algorithm: undefined, // Can be theme.darkAlgorithm for dark mode
});