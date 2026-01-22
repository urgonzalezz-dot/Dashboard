import Styles from './_Spinner.module.scss';
import React, { memo } from 'react';

import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

const Spinner = () => {
  return (
    <Stack
      className={Styles.spinner_container}
      sx={{ color: 'grey.500' }}
      spacing={2}
      direction="row"
    >
      <CircularProgress sx={{ color: '#833177' }} />
    </Stack>
  );
};

export default memo(Spinner);

Spinner.displayName = 'Spinner';
export { Spinner };
