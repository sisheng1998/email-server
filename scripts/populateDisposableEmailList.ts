import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

// disposable_email_blocklist.conf get from https://github.com/disposable-email-domains/disposable-email-domains

const populateDisposableEmailList = async () => {
  const filePath = path.join(
    process.cwd(),
    "scripts",
    "./disposable_email_blocklist.conf"
  );

  const fileContent = await readFile(filePath, {
    encoding: "utf-8",
  });

  const emailList = fileContent.split("\n").filter((line) => line.trim());

  const content = `export const DISPOSABLE_EMAIL_LIST: string[] = ${JSON.stringify(
    emailList,
    null,
    2
  )};`;

  await writeFile(
    path.join(process.cwd(), "src", "constants", "disposableEmailList.ts"),
    content
  );
};

populateDisposableEmailList()
  .then(() => {
    console.log("DISPOSABLE_EMAIL_LIST populated!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error populating DISPOSABLE_EMAIL_LIST: ", error);
    process.exit(1);
  });
