function limpiarConversationId(id) {
  return id?.startsWith('conv_') ? id.slice(5) : id;
}

export default limpiarConversationId;