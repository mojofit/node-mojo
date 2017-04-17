import {ChatMessage} from "../shared";
import * as _ from "lodash";

export class MessageController {

  private static instance = new MessageController();

  public static getInstance() {
    if (MessageController.instance == null) {
      MessageController.instance = new MessageController();
    }
    return MessageController.instance;
  }

  public static processMessage(chatMessage: ChatMessage): string {
    // MessageController.getInstance().helper();
    let message = chatMessage.message;
    if (_.includes(["hi", "hello", "hey"], message)) {
      return message + " from server";
    } else {
      return message ? message : <any>chatMessage;
    }
  }

  public helper() {
    // this is helper method
  }
}
