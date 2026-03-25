const fs = require("fs/promises");

(async () => {
  //commands
  const CREATE_FILE = "create file";
  const DELETE_FILE = "delete file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

  const createFile = async (path) => {
    try {
      //* open file to see if it exists, if it doesn't exist it will throw an error and we will create the file in the catch block
      const doesFileExist = await fs.open(path, "r"); //* "r" flag will open the file for reading, if the file doesn't exist it will throw an error */
      doesFileExist.close();

      return console.log(`File ${path} already exists`);
    } catch (e) {
      //* if the file doesn't exist, we will create it
      const createFileHandler = await fs.open(path, "w"); //* "w" flag will create the file if it doesn't exist and open it for writing
      createFileHandler.close();
      console.log("File created successfully");
    }
  };

  const deleteFile = async (path) => {
    //* delete the file at the given path
    try {
      await fs.unlink(path);
      console.log(`File:${path} was deleted.`);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("No file at this path.");
      } else {
        console.log("An error has occured:");
        console.log(error.message);
      }
    }
  };

  const renameFile = async (oldFilePath, newFilePath) => {
    //* rename the file at oldPath to newPath
    try {
      await fs.rename(oldFilePath, newFilePath);
      console.log(`File ${oldFilePath} renamed to ${newFilePath} successfully`);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(
          "No file at this path to rename, or destination doesn't exist.",
        );
      } else {
        console.log("An error has occured:");
        console.log(error.message);
      }
    }
  };

  let addedContent;

  const addToFile = async (path, content) => {
    if (addedContent === content) return;
    //* add the content to the file at the given path
    try {
      const fileHandler = await fs.open(path, "a"); //* "a" flag will open the file for appending, if the file doesn't exist it will create it */

      //   await fileHandler.appendFile(content); does the shame.
      await fileHandler.write(content);
      addedContent = content;

      fileHandler.close();

      console.log(`Content: "${content}" added to file ${path} successfully`);
    } catch (error) {
      console.error("There was an error adding to file.", error.message);
    }
  };

  const commandFileHandler = await fs.open("./command.txt", "r");

  commandFileHandler.on("change", async () => {
    //*get the size of the file
    const size = (await commandFileHandler.stat()).size;
    //* allocate a buffer to read the content of the file length
    const buf = Buffer.alloc(size);
    //*offset is the position in the buffer to start writing.
    const offset = 0;
    //*lenght is the number of bytes to read
    const length = buf.byteLength;
    //*position is the position in the file to start reading from
    const position = 0;

    //*We want to read the whole length of new content of the file after it has changed
    await commandFileHandler.read(buf, offset, length, position);

    //*
    const command = buf.toString("utf-8").trim();

    //*create a file:
    //*create a file <path>
    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      createFile(filePath);
    }

    //* delete a file:
    //* delete a file <path>
    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }

    //* rename a file:
    //* rename the file <oldPath> to <newPath>

    if (command.includes(RENAME_FILE)) {
      const _index = command.indexOf(" to ");
      const oldFilePath = command.substring(RENAME_FILE.length + 1, _index);
      const newFilePath = command.substring(_index + 4);
      renameFile(oldFilePath, newFilePath);
    }

    //* add to file:
    //* add to file <path> this content: <content>
    if (command.includes(ADD_TO_FILE)) {
      const _index = command.indexOf(" this content: ");
      const filePath = command.substring(ADD_TO_FILE.length + 1, _index);
      const content = command.substring(_index + 15);
      addToFile(filePath, content);
    }
  });

  const watcher = fs.watch("./command.txt");

  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
