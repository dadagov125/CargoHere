export enum ActionType {
  create = "create",
  edit = "edit",
  view = "view",
  delete = "delete"
}

export function getActionText(actionType: ActionType) {
  let text = '????';
  switch (actionType) {
    case ActionType.create:
      text = "Создать";
      break;
    case ActionType.edit:
      text = "Сохранить";
      break;
    case ActionType.view:
      text = "Просмотр";
      break;
    case ActionType.delete:
      text = "Удалить";
      break;
  }
  return text
}