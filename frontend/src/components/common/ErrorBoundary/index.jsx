import React from 'react';
import { Result, Button } from 'antd';
import { useTranslation } from 'react-i18next';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="خطأ في التطبيق"
          subTitle="عذراً، حدث خطأ غير متوقع. يرجى تحديث الصفحة أو المحاولة لاحقاً."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              تحديث الصفحة
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
