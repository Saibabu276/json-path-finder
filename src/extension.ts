// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { flatten } from "flat";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("Json Path Finder says Hi!!");

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "json-path-finder.jsonPath",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      try {
        const doc = vscode.window.activeTextEditor?.document;
        const activeFilePath = doc?.fileName.toString();
        if (activeFilePath?.toLowerCase().slice(-4) === "json" && !!doc) {
          const jsonFile = await JSON.parse(doc.getText());
          const selectedKey = await doc.getText(
            vscode.window.activeTextEditor?.selection
          );
          const pathsFound = Object.keys(flatten(jsonFile)).filter((path) => {
            return path.includes(selectedKey);
          });
          const paths: string[] = [];
          pathsFound.forEach((path) => {
            let splitPath = path.split(".");
            splitPath.forEach((objKey, index) => {
              if (objKey == selectedKey) {
                const jsonPath = splitPath.slice(0, index + 1).join(".");
                !paths.includes(jsonPath) && paths.push(jsonPath);
              }
            });
          });

          if (paths.length === 1) {
            await vscode.env.clipboard.writeText(paths[0]);
            vscode.window.showInformationMessage("Path copied to clipboard");
          } else if (paths.length > 1) {
            let str = "";
            for (let path of paths) {
              str += path + ', ';
            }
            vscode.window.showInformationMessage(str);
            vscode.window.showInformationMessage(
              "Multiple Properties found with given name!! Take your one from below."
            );
          }
		  else {
			vscode.window.showInformationMessage(
				"No paths found for selectedKey!\nplease make sure to select the key without quotes."
			  );
		  }
        } else {
          vscode.window.showErrorMessage(
            "Please open JSON file before running Json Path"
          );
        }
      } catch {
        vscode.window.showErrorMessage("Error! please try again");
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function search(path: string, obj: any, target: string): any {
  for (var k in obj) {
    if (obj.hasOwnProperty(k))
      if (obj[k] === target) return path + "['" + k + "']";
      else if (typeof obj[k] === "object") {
        var result = search(path + "['" + k + "']", obj[k], target);
        if (result) return result;
      }
  }
  return false;
}

// this method is called when your extension is deactivated
export function deactivate() {}
