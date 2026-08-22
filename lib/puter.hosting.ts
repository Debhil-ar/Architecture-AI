import {createHostingSlug, fetchBlobFromUrl, getImageExtension, HOSTING_CONFIG_KEY, imageUrlToPngBlob, isHostedUrl, getHostedUrl} from "./utils";
import * as trace_events from "node:trace_events";


export const getOrCreateHostingConfig = async (): Promise<HostingConfig | null> => {
const existing = ( await puter.kv.get(HOSTING_CONFIG_KEY)) as HostingConfig | null;
if (existing?.subdomain) return {subdomain: existing.subdomain};
const subdomain = createHostingSlug();
try {
const created = await puter.hosting.create(subdomain, '.' );

const record = {subdomain: created.subdomain };
await puter.kv.set(HOSTING_CONFIG_KEY, record);
return record;

}catch (e){
    console.warn(`Could not find sub-domain: ${e}`);
    return null;
}
}

export const uploadImageToHosting = async ({hosting, url, projectId, label }: StorHostedImageParams): Promise<HostedAsset | null> => {
if(!hosting || !url) return null;
if(isHostedUrl(url)) return {url};

try{
const resolved = label === "rendered"
        ? await imageUrlToPngBlob(url)
        .then((blob) => blob ? {blob, contentType:
        'image/png'}: null)
    :await fetchBlobFromUrl(url)
    if (!resolved) return null;

    const contentType = resolved.contentType || resolved.blob.type || '';
    const ext = getImageExtension(contentType, url);
    const dir = `project/${projectId}`;
    const filePath = `${dir}/${label}.${ext}`;
    const uploadFile = new File([resolved.blob], `${label}.${ext}`, {type: contentType});

    await puter.fs.mkdir(dir, {createMissingParents: true});
    await puter.fs.write(filePath, uploadFile);

    const hostedUrl = getHostedUrl({subdomain: hosting.subdomain}, filePath);

    return hostedUrl ? {url: hostedUrl} : null;
} catch (e) {
    console.warn(`Failed to store Image: ${e}`);
    return null;
}
}