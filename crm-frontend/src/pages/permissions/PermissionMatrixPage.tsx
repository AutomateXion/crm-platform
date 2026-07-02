import React, { useState, useEffect } from 'react';
import {
  Select, Card, Table, Tag, Button, Space, Typography, Spin,
  message, Tooltip, Alert, Badge, Row, Col, Collapse,
} from 'antd';
import { SaveOutlined, CopyOutlined, ReloadOutlined, SafetyOutlined } from '@ant-design/icons';
import { permissionsApi, usersApi } from '../../services/api';
import { useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const PERM_LEVELS = [
  { value: 'FA', label: 'Full Access', color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
  { value: 'VO', label: 'View Only',   color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff' },
  { value: 'HI', label: 'Hidden',      color: '#fa8c16', bg: '#fff7e6', border: '#ffd591' },
  { value: 'NA', label: 'No Access',   color: '#ff4d4f', bg: '#fff1f0', border: '#ffa39e' },
  { value: 'MA', label: 'Mandatory',   color: '#2E6DA4', bg: '#f9f0ff', border: '#d3adf7' },
];

function PermBadge({ level, onChange, readonly }: { level: string; onChange?: (v: string) => void; readonly?: boolean }) {
  const def = PERM_LEVELS.find(p => p.value === level) || PERM_LEVELS[3];
  if (readonly) {
    return (
      <Tag style={{ background: def.bg, color: def.color, border: `1px solid ${def.border}`, borderRadius: 20, fontWeight: 600, fontSize: 11 }}>
        {def.label}
      </Tag>
    );
  }
  return (
    <Select
      value={level} size="small" style={{ width: 120 }}
      onChange={onChange}
      dropdownStyle={{ minWidth: 140 }}
    >
      {PERM_LEVELS.map(p => (
        <Option key={p.value} value={p.value}>
          <Tag style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}`, borderRadius: 20, fontWeight: 600, margin: 0 }}>
            {p.label}
          </Tag>
        </Option>
      ))}
    </Select>
  );
}

export default function PermissionMatrixPage() {
  const [searchParams] = useSearchParams();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>(searchParams.get('groupId') || '');
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [permMap, setPermMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copyFrom, setCopyFrom] = useState<string>('');

  useEffect(() => {
    usersApi.getGroups().then(r => setGroups(r.data)).catch(() => {});
    permissionsApi.getModules().then(r => setHierarchy(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedGroup) loadGrid();
  }, [selectedGroup]);

  const loadGrid = async () => {
    setLoading(true);
    try {
      const r = await permissionsApi.getGrid(selectedGroup);
      setPermMap(r.data.permMap || {});
    } catch { message.error('Failed to load permissions'); }
    finally { setLoading(false); }
  };

  const getKey = (...ids: (string | null)[]) => ids.filter(Boolean).join(':');

  const getPerm = (moduleId: string, subId?: string, pageId?: string, fieldId?: string) => {
    const key = getKey(moduleId, subId || null, pageId || null, fieldId || null);
    return permMap[key] || 'NA';
  };

  const setPerm = (level: string, moduleId: string, subId?: string, pageId?: string, fieldId?: string) => {
    const key = getKey(moduleId, subId || null, pageId || null, fieldId || null);
    setPermMap(prev => ({ ...prev, [key]: level }));
  };

  const setModuleAll = (moduleId: string, level: string, module: any) => {
    const updates: Record<string, string> = {};
    updates[moduleId] = level;
    for (const sub of module.subModules || []) {
      updates[getKey(moduleId, sub.subModuleId)] = level;
      for (const page of sub.pages || []) {
        updates[getKey(moduleId, sub.subModuleId, page.pageId)] = level;
        for (const field of page.fields || []) {
          updates[getKey(moduleId, sub.subModuleId, page.pageId, field.fieldId)] = level;
        }
      }
    }
    setPermMap(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (!selectedGroup) return;
    setSaving(true);
    try {
      const permissions = Object.entries(permMap).map(([key, level]) => {
        const parts = key.split(':');
        return {
          moduleId: parts[0] || null,
          subModuleId: parts[1] || null,
          pageId: parts[2] || null,
          fieldId: parts[3] || null,
          permissionLevel: level,
        };
      });
      await permissionsApi.setPermissions({ userGroupId: selectedGroup, permissions });
      message.success('Permissions saved successfully');
    } catch { message.error('Failed to save permissions'); }
    finally { setSaving(false); }
  };

  const handleCopy = async () => {
    if (!copyFrom || !selectedGroup) return;
    try {
      await permissionsApi.copyPermissions({ sourceGroupId: copyFrom, targetGroupId: selectedGroup });
      message.success('Permissions copied');
      loadGrid();
    } catch { message.error('Copy failed'); }
  };

  const selectedGroupName = groups.find(g => g.userGroupId === selectedGroup)?.groupName;

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await permissionsApi.sync();
      const d = r.data || {};
      message.success(`Synced: ${d.pages || 0} new page(s), ${d.modules || 0} module(s) registered`);
      await load();
    } catch { message.error('Sync failed'); }
    finally { setSyncing(false); }
  };
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Permission Matrix</Title>
          <Text type="secondary">Configure module, page and field access per user group</Text>
        </div>
        <Space>
          {selectedGroup && (
            <Button icon={<ReloadOutlined />} loading={syncing} onClick={handleSync} style={{ borderRadius: 8 }}>
              Sync Permissions
            </Button>
            <Button icon={<SaveOutlined />} type="primary" loading={saving} onClick={handleSave} style={{ borderRadius: 8 }}>
              Save Permissions
            </Button>
          )}
        </Space>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong style={{ marginRight: 8 }}>User Group:</Text>
            <Select
              value={selectedGroup || undefined}
              placeholder="Select a user group to configure"
              style={{ width: 280 }}
              onChange={setSelectedGroup}
            >
              {groups.map(g => (
                <Option key={g.userGroupId} value={g.userGroupId}>
                  <Space>
                    {g.groupName}
                    {g.isSystemGroup && <Tag color="purple" style={{ fontSize: 10 }}>System</Tag>}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          {selectedGroup && (
            <>
              <Col>
                <Text style={{ color: '#8c8c8c' }}>Copy from:</Text>
              </Col>
              <Col>
                <Select
                  value={copyFrom || undefined}
                  placeholder="Select source group"
                  style={{ width: 200 }}
                  onChange={setCopyFrom}
                  allowClear
                >
                  {groups.filter(g => g.userGroupId !== selectedGroup).map(g => (
                    <Option key={g.userGroupId} value={g.userGroupId}>{g.groupName}</Option>
                  ))}
                </Select>
              </Col>
              <Col>
                <Button icon={<CopyOutlined />} onClick={handleCopy} disabled={!copyFrom} style={{ borderRadius: 8 }}>
                  Copy Permissions
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Card>

      {!selectedGroup && (
        <Alert
          message="Select a User Group above to view and configure its permissions."
          type="info" showIcon icon={<SafetyOutlined />}
          style={{ borderRadius: 12 }}
        />
      )}

      {selectedGroup && (
        <Spin spinning={loading}>
          <Collapse defaultActiveKey={hierarchy.map(m => m.moduleId)} style={{ background: 'none', border: 'none' }}>
            {hierarchy.map(mod => (
              <Panel
                key={mod.moduleId}
                style={{ marginBottom: 12, background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}
                header={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Space>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: mod.moduleColor || '#1890ff' }} />
                      <Text strong style={{ fontSize: 14 }}>{mod.moduleName}</Text>
                      {mod.isCore && <Tag color="purple" style={{ fontSize: 10 }}>Core</Tag>}
                    </Space>
                    <Space onClick={e => e.stopPropagation()}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Set all:</Text>
                      {['FA', 'VO', 'NA'].map(l => {
                        const def = PERM_LEVELS.find(p => p.value === l)!;
                        return (
                          <Tag
                            key={l} style={{ cursor: 'pointer', background: def.bg, color: def.color, border: `1px solid ${def.border}`, borderRadius: 20, fontWeight: 600 }}
                            onClick={() => setModuleAll(mod.moduleId, l, mod)}
                          >
                            {def.label}
                          </Tag>
                        );
                      })}
                      <PermBadge level={getPerm(mod.moduleId)} onChange={v => setPerm(v, mod.moduleId)} />
                    </Space>
                  </div>
                }
              >
                {(mod.subModules || []).map((sub: any) => (
                  <div key={sub.subModuleId} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: '#fafafa', borderRadius: 8, marginBottom: 8 }}>
                      <Text style={{ fontWeight: 600, color: '#595959', fontSize: 13 }}>📁 {sub.subModuleName}</Text>
                      <PermBadge level={getPerm(mod.moduleId, sub.subModuleId)} onChange={v => setPerm(v, mod.moduleId, sub.subModuleId)} />
                    </div>

                    {(sub.pages || []).map((page: any) => (
                      <div key={page.pageId} style={{ marginLeft: 16, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderLeft: '3px solid #e8e8e8', marginBottom: 6 }}>
                          <Text style={{ color: '#1a1a2e', fontWeight: 500 }}>📄 {page.pageName}</Text>
                          <PermBadge level={getPerm(mod.moduleId, sub.subModuleId, page.pageId)} onChange={v => setPerm(v, mod.moduleId, sub.subModuleId, page.pageId)} />
                        </div>

                        {(page.fields || []).length > 0 && (
                          <div style={{ marginLeft: 24 }}>
                            <Table
                              size="small" pagination={false}
                              dataSource={page.fields}
                              rowKey="fieldId"
                              showHeader={false}
                              style={{ background: 'transparent' }}
                              columns={[
                                {
                                  dataIndex: 'fieldLabel', key: 'label',
                                  render: (v: string, r: any) => (
                                    <Space>
                                      <Text style={{ fontSize: 12, color: '#595959' }}>⬡ {v}</Text>
                                      <Tag style={{ fontSize: 10, borderRadius: 4 }}>{r.fieldType}</Tag>
                                    </Space>
                                  ),
                                },
                                {
                                  key: 'perm', width: 140, align: 'right' as const,
                                  render: (_: any, field: any) => (
                                    <PermBadge
                                      level={getPerm(mod.moduleId, sub.subModuleId, page.pageId, field.fieldId)}
                                      onChange={v => setPerm(v, mod.moduleId, sub.subModuleId, page.pageId, field.fieldId)}
                                    />
                                  ),
                                },
                              ]}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </Panel>
            ))}
          </Collapse>
        </Spin>
      )}
    </div>
  );
}
