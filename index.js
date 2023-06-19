import { PicGo } from "picgo";
import fs from "fs/promises"
import { exec,execSync } from "child_process";
import { spawnSync } from "child_process";
import web_uploader from "picgo-plugin-web-uploader";
import notifier from "node-notifier";
const picgo = new PicGo("config.json");


/* 保存来自剪切板中的图片 */

const saveClipboardImage = async (filePath) => {
  try {
    const clipboardImage = execSync("wl-paste --type image/png", {
      encoding: "buffer",
    });

    if (clipboardImage) {
      await fs.writeFile(filePath, clipboardImage);
      console.log("Image saved to", filePath);
    } else {
      console.log("No image found in clipboard");
    }
  } catch (error) {
    console.error("Failed to access clipboard:", error);
  }
};
// 调用函数保存剪切板中的图片
saveClipboardImage("./clipboard-image.jpg")

/* 把图片链接保存在剪切板中 */
const copyToClipboard = (text) => {
  try {
    notifier.notify({
      title: 'picgo-core',
      message: `上传成功,已经剪切到剪切板\n图片地址为: ![](${text})`,
      sound: true,
    });
    const markdownText = `![](${text})`;
    spawnSync("wl-copy", [markdownText], { detached: true, stdio: "ignore" });
    console.log("Copied to clipboard");
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
  }
};

/* picgo 插件加载  */
const plugin = picgo.use(web_uploader); //加载插件
plugin.register("picgo_web_uploader"); //注册插件

/*主函数--上传函数*/
const main = async () => {
  const filePath = "./clipboard-image.jpg";//图片路径
  const res = await picgo.upload([filePath]); //上传图片
  const imgUrl = res[0].imgUrl; //获取图片链接
  console.log(imgUrl)
  fs.unlink(filePath).then(() => {
    console.log("删除文件成功");
  }
  );
  await copyToClipboard(imgUrl); //复制到剪切板
};
main();
