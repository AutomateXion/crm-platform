import { useSelector } from 'react-redux';
import { RootState } from '../store';

export type PermLevel = 'FA' | 'VO' | 'HI' | 'NA' | 'MA';

export function usePermissions() {
  const permissions = useSelector((s: RootState) => s.auth.permissions);

  const canAccessModule = (moduleCode: string): boolean => {
    const mod = permissions?.modules?.[moduleCode];
    return mod && mod.level !== 'NA' && mod.level !== 'HI';
  };

  const canAccessPage = (moduleCode: string, subModule: string, pageCode: string): boolean => {
    const page = permissions?.modules?.[moduleCode]?.subModules?.[subModule]?.pages?.[pageCode];
    if (!page) return false;
    return page.level !== 'NA' && page.level !== 'HI';
  };

  const getFieldPermission = (
    moduleCode: string, subModule: string, pageCode: string, fieldCode: string
  ): PermLevel => {
    return permissions?.modules?.[moduleCode]
      ?.subModules?.[subModule]
      ?.pages?.[pageCode]
      ?.fields?.[fieldCode] ?? 'FA';
  };

  const isFieldVisible = (moduleCode: string, subModule: string, pageCode: string, fieldCode: string): boolean => {
    const level = getFieldPermission(moduleCode, subModule, pageCode, fieldCode);
    return level !== 'HI' && level !== 'NA';
  };

  const isFieldEditable = (moduleCode: string, subModule: string, pageCode: string, fieldCode: string): boolean => {
    const level = getFieldPermission(moduleCode, subModule, pageCode, fieldCode);
    return level === 'FA' || level === 'MA';
  };

  const isFieldMandatory = (moduleCode: string, subModule: string, pageCode: string, fieldCode: string): boolean => {
    return getFieldPermission(moduleCode, subModule, pageCode, fieldCode) === 'MA';
  };

  return { canAccessModule, canAccessPage, getFieldPermission, isFieldVisible, isFieldEditable, isFieldMandatory };
}
