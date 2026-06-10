export class Message {
  constructor({
    id,
    ticketId,
    authorEmail,
    authorName,
    authorRole,
    content,
    createdAt,
    readBy = [],
  }) {
    this.id = id;
    this.ticketId = Number(ticketId);
    this.authorEmail = authorEmail;
    this.authorName = authorName;
    this.authorRole = authorRole;
    this.content = content;
    this.createdAt = createdAt;
    this.readBy =
      Array.isArray(readBy) && readBy.length ? readBy : [authorEmail];
  }
}
