// BKAV HaiHS : Hằng số định nghĩa ma trận phân quyền RBAC - start
export const USER_PERMISSION_MATRIX = [
  { id: "USER_C", actionKey: "act_create", descKey: "desc_new_res" },
  { id: "USER_R", actionKey: "act_read", descKey: "desc_res_data" },
  { id: "USER_U", actionKey: "act_update", descKey: "desc_edit_content" },
  { id: "USER_D", actionKey: "act_delete", descKey: "desc_remove_assets" },
];

export const GROUP_PERMISSION_MATRIX = [
  { id: "GROUP_C", actionKey: "act_create", descKey: "desc_new_groups" },
  { id: "GROUP_R", actionKey: "act_read", descKey: "desc_group_data" },
  { id: "GROUP_U", actionKey: "act_update", descKey: "desc_edit_group" },
  { id: "GROUP_D", actionKey: "act_delete", descKey: "desc_delete_group" },
  {
    id: "GROUP_ADD_USER",
    actionKey: "act_add_user",
    descKey: "desc_add_bulk",
  },
  {
    id: "GROUP_DELETE_USER",
    actionKey: "act_del_user",
    descKey: "desc_del_bulk",
  },
];
// BKAV HaiHS : Hằng số định nghĩa ma trận phân quyền RBAC - end
