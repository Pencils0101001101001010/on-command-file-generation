const fs = require("fs/promises");

(async () => {
  const commandFileHandler = await fs.open("./command.txt", "r");
  const watcher = fs.watch("./command.txt");

  for await (const event of watcher) {
    if (event.eventType === "change") {
      console.log("File changed, reading new content...");

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

      //*We want to read the new content of the file after it has changed
      const content = await commandFileHandler.read(
        buf,
        offset,
        length,
        position,
      );
      console.log("New content:", content);
    }
  }
})();
