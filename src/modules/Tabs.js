import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

export default function MainTabs({ tab, onChange, labels }) {
  return (
    <Tabs
      value={tab}
      onChange={onChange}
      textColor="primary"
      indicatorColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      sx={{ minHeight: 32, mx: 'auto' }}
    >
      {labels.map((label, i) => (
        <Tab key={label} label={label} sx={{ minHeight: 32, fontSize: 13, px: 1.5 }} />
      ))}
    </Tabs>
  );
}
