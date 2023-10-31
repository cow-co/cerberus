import { Button, IconButton, List, ListItem, ListItemIcon } from '@mui/material';
import Grid from '@mui/material/Grid';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

const TaskItem = ({task, deleteTask, editTask}) => {
  const paramsList = task.params.map(param => {
    return <ListItem key={param.name}>{param.name}: {param.value}</ListItem>
  });
  const sentIcon = task.sent ? (<CheckBoxIcon />) : (<CheckBoxOutlineBlankIcon />);
  const editButton = task.sent ? (null) : (<Button onClick={editTask}>Edit</Button>);
  const deleteBtn = task.sent ? (null) : (<IconButton onClick={deleteTask}><DeleteForeverIcon /></IconButton>);
  
  return (
      <ListItem className={"listElement"} key={task.order}>
        <ListItemIcon>
          {sentIcon}
        </ListItemIcon>
        <Grid item xs={1}>
          <h4>Order: {task.order}</h4>
        </Grid>
        <Grid item xs={3}>
          <h4>Type: {task.taskType}</h4>
        </Grid>
        <Grid item xs={6}>
          <h4>Params:</h4>
          <List>
            {paramsList}
          </List>
        </Grid>
        <Grid item xs={1}>
          {editButton}
        </Grid>
        <Grid item xs={1}>
          {deleteBtn}
        </Grid>
      </ListItem>
    );
}

export default TaskItem