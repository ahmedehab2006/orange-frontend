import { Card, Badge } from '../Components .jsx';

export default function Dashboard() {
  return (
    <div style={{ padding: '28px 32px' }}>
      <Card title="This Week's Top Reach">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Badge variant="new" shape="pill">New</Badge>
          <span>SHBRA-ABU-FARG — 1,840 customers</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
          <Badge variant="upgrade" shape="pill">Upgrade</Badge>
          <span>NASR-CITY-MALL-07 — 2,380 customers</span>
        </div>
      </Card>
    </div>
  );
}