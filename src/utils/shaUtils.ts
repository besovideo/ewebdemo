function ArrayBufferToHexString(arrayBuffer: ArrayBuffer) {
  const hashArray = Array.from(new Uint8Array(arrayBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

export async function SHA256UsernamePwd(username: string, password: string) {
  const textEncoder = new TextEncoder();
  const encryUsername_Password_ArrayBuffer = await window.crypto.subtle.digest(
    "SHA-256",
    textEncoder.encode(`${username}_${password}`)
  );

  return ArrayBufferToHexString(encryUsername_Password_ArrayBuffer);
}

async function SHA256AddTimestamp(sha256UPStr: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const textEncoder = new TextEncoder();
  const encryUsername_Password_ArrayBuffer = await window.crypto.subtle.digest(
    "SHA-256",
    textEncoder.encode(`${sha256UPStr}_${timestamp}`)
  );
  const password_encrypted =
    "SHA256_T:" + ArrayBufferToHexString(encryUsername_Password_ArrayBuffer);
  return {
    password_encrypted,
    timestamp,
  };
}

// https://bvcsp.apifox.cn/api-171248814
// 此接口为SHA256_T:的接口，处理流程按照上面链接文档的流程进行的
export async function SHA256Timestamp(username: string, password: string) {
  // sha256('username_password')
  const sha256UPStr = await SHA256UsernamePwd(username, password);

  // 对 sha256UPStr 结果加上_timestamp，再进行sha256，之后再加上前缀SHA256_T:前缀
  const sha256T = SHA256AddTimestamp(sha256UPStr);
  return sha256T;
}
