import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { MemberView } from 'src/sections/inventory/view';

// ----------------------------------------------------------------------

export default function InventoryPage() {
  return (
    <>
      <Helmet>
        <title>{`Member - ${CONFIG.appName}`}</title>
      </Helmet>

      <MemberView />
    </>
  );
}
