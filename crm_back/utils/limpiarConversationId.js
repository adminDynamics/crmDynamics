function limpiarConversationId(id) {
  return id?.startsWith('conv_') ? id.slice(5) : id;
}

module.exports = limpiarConversationId;