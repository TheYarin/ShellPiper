import { ReactElement } from "react";
import { unmountComponentAtNode, render } from "react-dom";

export type closeDialogType = (returnValue: any) => void;

export function openDetachedDialog(
  dialogComponentGenerator: (closeDialog: closeDialogType) => ReactElement,
  id: string
): Promise<any> {
  const divTarget = document.createElement("div");
  divTarget.id = id;
  document.body.appendChild(divTarget);

  let promiseResolve: (value: any) => void;

  const returnValuePromise = new Promise<any>((resolve, _reject) => {
    promiseResolve = resolve;
  });

  const closeDialog = (returnValue: any) => {
    unmountComponentAtNode(divTarget);
    document.body.removeChild(divTarget);
    promiseResolve(returnValue);
  };

  const dialogComponent = dialogComponentGenerator(closeDialog);
  render(dialogComponent, divTarget);

  return returnValuePromise;
}
