const fs = require("fs/promises");

(async () => {
  //commands
  const CREATE_FILE = "create a file";
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
    const command = buf.toString("utf-8");

    //*create a file:
    //*create a file <path>
    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      createFile(filePath);
    }
  });

  const watcher = fs.watch("./command.txt");

  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
