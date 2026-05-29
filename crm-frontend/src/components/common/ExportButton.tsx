import React, { useState } from 'react';
import { Button, Dropdown, message } from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined, FileTextOutlined, DownOutlined } from '@ant-design/icons';
import { exportToPDF, exportToExcel, exportToXML, exportToCSV, ExportConfig } from '../../utils/exportUtils';

interface Props {
  config: ExportConfig;
  size?: 'small' | 'middle' | 'large';
}

export default function ExportButton({ config, size = 'middle' }: Props) {
  const [loading, setLoading] = useState('');

  const handleExport = async (type: string) => {
    setLoading(type);
    try {
      switch (type) {
        case 'pdf':
          if (!config.elementId) { message.error('PDF export requires elementId'); break; }
          await exportToPDF(config.elementId, config.filename, config.orientation || 'portrait');
          message.success('PDF exported successfully!');
          break;
        case 'excel':
          if (!config.data) { message.error('No data to export'); break; }
          exportToExcel(config.data, config.filename, config.sheetName || 'Report', config.headers);
          message.success('Excel exported successfully!');
          break;
        case 'xml':
          if (!config.data) { message.error('No data to export'); break; }
          exportToXML(config.data, config.filename, config.xmlRoot || 'Report', config.xmlItem || 'Row');
          message.success('XML exported successfully!');
          break;
        case 'csv':
          if (!config.data) { message.error('No data to export'); break; }
          exportToCSV(config.data, config.filename, config.headers);
          message.success('CSV exported successfully!');
          break;
      }
    } catch (e) {
      message.error('Export failed. Please try again.');
    } finally {
      setLoading('');
    }
  };

  const items = [
    { key: 'pdf', label: <><FilePdfOutlined style={{ color: '#ff4d4f' }} /> Export as PDF</>, disabled: !config.elementId },
    { key: 'excel', label: <><FileExcelOutlined style={{ color: '#52c41a' }} /> Export as Excel (.xlsx)</>, disabled: !config.data },
    { key: 'xml', label: <><FileTextOutlined style={{ color: '#1890ff' }} /> Export as XML</>, disabled: !config.data },
    { key: 'csv', label: <><FileTextOutlined style={{ color: '#fa8c16' }} /> Export as CSV</>, disabled: !config.data },
  ];

  return (
    <Dropdown menu={{ items, onClick: ({ key }) => handleExport(key) }} trigger={['click']}>
      <Button icon={<DownloadOutlined />} loading={!!loading} size={size}>
        Export <DownOutlined />
      </Button>
    </Dropdown>
  );
}
