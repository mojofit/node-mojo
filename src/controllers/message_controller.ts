import {ChatMessage} from "../shared";
import * as _ from "lodash";

class MessageController {

  constructor() {
  }

  public processMessage(chatMessage: ChatMessage): string {
    let message = chatMessage.message;
    if (_.includes(["hi", "hello", "hey"], message)) {
      return message + " from server";
    } else {
      return message ? message : <any>chatMessage;
    }
  }
}

export default new MessageController();
