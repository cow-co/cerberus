// This dialogue allows an admin to promote/demote another user to/from admin
// Also in future will allow creation of task types

import { useState, useEffect } from 'react';
import { InputLabel, FormControl, Select, Dialog, DialogTitle, Button, TextField } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";

const AdminDialogue = (props) => {
  const {onClose, open, onSubmit} = props;
  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Administrator Interface</DialogTitle>
      <FormControl fullWidth>
        <InputLabel id="task-type-label">Search for User</InputLabel>
        <Select className="select-list" labelId="task-type-label" value={task.type.name} label="Task Type" onChange={handleChange}>
          {taskTypeSelects}
        </Select>
        {paramsSettings}
        <Button onClick={handleSubmit}>Create</Button>
      </FormControl>
    </Dialog>
  );
}