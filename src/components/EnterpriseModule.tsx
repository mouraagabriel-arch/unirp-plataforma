import { EnterpriseDashboard } from './enterprise/EnterpriseDashboard';
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

interface EnterpriseModuleProps {
  activeTab: string;
  isDarkMode: boolean;
}

export function EnterpriseModule({ activeTab, isDarkMode }: EnterpriseModuleProps) {
  switch (activeTab) {
    case 'dashboard':
      return <EnterpriseDashboard isDarkMode={isDarkMode} />;
    case 'cerebro':
      return <EnterpriseCerebro isDarkMode={isDarkMode} />;
    case 'hub':
      return <EnterpriseHub isDarkMode={isDarkMode} />;
    case 'crm':
      return <EnterpriseCRM isDarkMode={isDarkMode} />;
    case 'clipping':
      return <EnterpriseClipping isDarkMode={isDarkMode} />;
    case 'comunicacao':
      return <EnterpriseComunicacao isDarkMode={isDarkMode} />;
    case 'influenciadores':
      return <EnterpriseInfluenciadores isDarkMode={isDarkMode} />;
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
    default:
      return <EnterpriseDashboard isDarkMode={isDarkMode} />;
  }
}
