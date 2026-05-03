/** First-class DOM event listener binding. */
export class EventBinding {
  event: string
  handler: Function

  constructor(event: string, handler: Function) {
    this.event = event
    this.handler = handler
  }
}
