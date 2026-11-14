import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";
import { S3_BUCKET, S3_PREFIX } from "../config/env.js";
import { toRelativePath } from "../utils/path.util.js";

export async function listRemoteFiles():Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: S3_PREFIX,
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents ?? []) {
      if (!object.Key || object.Key.endsWith("/")) continue;
      keys.push(toRelativePath(object.Key));
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined
  } while (continuationToken);

  return keys;
}
