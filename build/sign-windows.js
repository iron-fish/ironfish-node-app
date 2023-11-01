const { exec } = require("child_process");

exports.default = async function (configuration) {
  return new Promise((resolve, reject) => {
    const cmd = `AzureSignTool sign -kvu "${process.env.AZURE_KEY_VAULT_URI}" -kvi "${process.env.AZURE_CLIENT_ID}" -kvt "${process.env.AZURE_TENANT_ID}" -kvs "${process.env.AZURE_CLIENT_SECRET}" -kvc "${process.env.AZURE_CERT_NAME}" -tr http://timestamp.digicert.com -v "${configuration.path}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log(`Manual Sign exe Error: ${error}`);
        return reject(error);
      }
      if (stderr) {
        console.log(`Manual Sign exe Stderr: ${stderr}`);
        return reject(new Error(stderr));
      }

      console.log(`Manual Sign exe Stdout: ${stdout}`);
      resolve(stdout);
    });
  });
};
