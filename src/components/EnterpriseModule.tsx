import { EnterpriseCerebro } from './enterprise/EnterpriseCerebro';
import { EnterpriseHub } from './enterprise/EnterpriseHub';
import { EnterpriseCRM } from './enterprise/EnterpriseCRM';
import { EnterpriseClipping } from './enterprise/EnterpriseClipping';
import { EnterpriseComunicacao } from './enterprise/EnterpriseComunicacao';
import { EnterpriseInfluenciadores } from './enterprise/EnterpriseInfluenciadores';
import { EnterprisePlanning } from './enterprise/EnterprisePlanning';
import { EnterpriseWorkflow } from './enterprise/EnterpriseWorkflow';
import { EnterpriseSalaImprensa } from './enterprise/EnterpriseSalaImprensa';
import { EnterpriseAtas } from './enterprise/EnterpriseAtas';
import { EnterprisePlan } from './enterprise/EnterprisePlan';
import { EnterpriseSettings } from './enterprise/EnterpriseSettings';
import { EnterpriseReports } from './enterprise/EnterpriseReports';
import { EnterpriseSocial } from './enterprise/EnterpriseSocial';
import { EnterpriseHelp } from './enterprise/EnterpriseHelp';
import { EnterpriseDashboard } from './enterprise/EnterpriseDashboard';
import { EnterpriseAdminConsole } from './enterprise/EnterpriseAdminConsole';
import { EnterpriseOuvidoria } from './enterprise/EnterpriseOuvidoria';

interface EnterpriseModuleProps {
  activeTab: string;
  isDarkMode: boolean;
}

export function EnterpriseModule({ activeTab, isDarkMode }: EnterpriseModuleProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EnterpriseDashboard isDarkMode={isDarkMode} />;
      case 'admin-console':
        return <EnterpriseAdminConsole isDarkMode={isDarkMode} />;
      case 'admin-overview':
      case 'admin-tenants':
      case 'admin-site':
      case 'audit-logs':
        return <EnterpriseAdminConsole isDarkMode={isDarkMode} />;
      case 'cerebro':
        return <EnterpriseCerebro isDarkMode={isDarkMode} />;
      case 'hub':
        return <EnterpriseHub isDarkMode={isDarkMode} />;
      case 'crm':
        return <EnterpriseCRM isDarkMode={isDarkMode} />;
      case 'clipping':
        return <EnterpriseClipping isDarkMode={isDarkMode} />;
      case 'social-listening':
        return <EnterpriseSocial isDarkMode={isDarkMode} />;
      case 'comunicacao':
        return <EnterpriseComunicacao isDarkMode={isDarkMode} />;
      case 'influenciadores':
        return <EnterpriseInfluenciadores isDarkMode={isDarkMode} />;
      case 'ouvidoria':
        return <EnterpriseOuvidoria isDarkMode={isDarkMode} />;
      case 'planejamento':
        return <EnterprisePlanning isDarkMode={isDarkMode} />;
      case 'workflow':
        return <EnterpriseWorkflow isDarkMode={isDarkMode} />;
      case 'sala-imprensa':
        return <EnterpriseSalaImprensa isDarkMode={isDarkMode} />;
      case 'atas':
        return <EnterpriseAtas isDarkMode={isDarkMode} />;
      case 'plano':
        return <EnterprisePlan isDarkMode={isDarkMode} />;
      case 'relatorios':
        return <EnterpriseReports isDarkMode={isDarkMode} />;
      case 'configuracoes':
        return <EnterpriseSettings isDarkMode={isDarkMode} />;
      case 'ajuda':
        return <EnterpriseHelp isDarkMode={isDarkMode} />;
      default:
        return <EnterpriseDashboard isDarkMode={isDarkMode} />;
    }
  };

  return <div className="w-full h-full max-w-7xl mx-auto px-4">{renderContent()}</div>;
}
