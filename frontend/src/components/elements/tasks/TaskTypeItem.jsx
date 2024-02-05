import { IconButton, List, ListItem } from '@mui/material';
import Grid from '@mui/material/Grid';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const TaskTypeItem = ({taskType, deleteTaskType}) => {
  const paramsList = taskType.params.map(param => {
    return <ListItem key={param._id}>{param.name} ({param.type})</ListItem>
  });

  return (
      <ListItem className={"listElement"} key={taskType.name}>
        <Grid item xs={4}>
          <h4>{taskType.name}</h4>
        </Grid>
        <Grid item xs={6}>
          <h4>Params:</h4>
          <List>
            {paramsList}
          </List>
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={deleteTaskType}><DeleteForeverIcon /></IconButton>
        </Grid>
      </ListItem>
    )
}

export default TaskTypeItem