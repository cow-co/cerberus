import {useRouteError} from "react-router-dom";
import { Box, Grid, Typography } from '@mui/material';

function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <Box sx={{flexGrow: 1}}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h2" align="center">Error: {error.statusText || error.message}</Typography>
          <Typography variant="body1" align="center">An error has occurred in loading this page! Try refreshing the page, or going back to the previous page.</Typography>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ErrorPage;