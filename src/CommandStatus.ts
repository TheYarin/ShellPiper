enum CommandStatus {
  NEW,
  RUNNING,
  KILLED_UNKNOWN_REASON,
  KILLED_MANUALLY,
  KILLED_NEXT_COMMAND_CLOSED,
  ERROR,
  EXITED,
}

export default CommandStatus;
