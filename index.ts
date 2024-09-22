import Elysia, { t } from "elysia";
import { swagger } from "@elysiajs/swagger";

const extractVersionInfo = (
  input: string
): {
  version: string;
  date: string;
  libraryVersion: string;
  input: string;
} => {
  const versionMatch = input.match(/ldapsearch (\d+\.\d+\.\d+)/);
  const dateMatch = input.match(/\((\w+ \d+ \d+ \d+:\d+:\d+)\)/);
  const libraryVersionMatch = input.match(/LDAP library: OpenLDAP (\d+)/);

  return {
    version: versionMatch?.at(1) ?? "",
    date: dateMatch?.at(1) ?? "",
    libraryVersion: libraryVersionMatch?.at(1) ?? "",
    input,
  };
};

enum Format {
  JSON = "json",
  TEXT = "text",
}

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "OpenLDAP Search Server",
          version: "1.0.0",
          description: "OpenLDAP Search Server API",
        },
      },
    })
  )
  .get(
    "/version/:format?",
    async ({ params: { format } }) => {
      const result = await (await Bun.$`ldapsearch -VV`).stderr.toString();
      console.log("Version text", result);

      if (format === Format.JSON) {
        return extractVersionInfo(result);
      }

      return result;
    },
    {
      params: t.Object({
        format: t.Optional(t.Enum(Format)),
      }),
      response: {
        200: t.Union([
          t.String(),
          t.Object({
            version: t.String(),
            date: t.String(),
            libraryVersion: t.String(),
            input: t.String(),
          }),
        ]),
      },
    }
  )
  .post(
    "/search",
    async ({
      body: { host, bindDn, bindPassword, searchBase, searchFilter },
    }) => {
      console.log(`Incoming request to ${host}`);
      searchFilter = searchFilter || "(objectClass=*)";
      const result =
        await Bun.$`ldapsearch -H ${host} -D ${bindDn} -w ${bindPassword} -b ${searchBase} "${searchFilter}"`.text();

      // Transform result to JSON
      const lines = result
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => !line.startsWith("#") && line.length > 0)
        .map((line) => line.split(/:+\s?/, 2).map((v) => v.trim()));
      const resultObj: any = {};
      for (const line of lines) {
        const [key, value] = line;
        if (!resultObj[key]) resultObj[key] = [];
        resultObj[key].push(value);
      }
      for (const key of Object.keys(resultObj)) {
        if (resultObj[key].length === 1) resultObj[key] = resultObj[key][0];
      }
      return resultObj;
    },
    {
      body: t.Object({
        host: t.String(),
        bindDn: t.String(),
        bindPassword: t.String(),
        searchBase: t.String(),
        searchFilter: t.Optional(t.String()),
      }),
    }
  );

app.listen(3000, () =>
  console.log(`
Listening on port 3000
To use this, send a post request to /search with the following JSON body
{
  "host": "ldap://localhost",
  "bindDn": "cn=Manager,dc=example,dc=com",
  "bindPassword": "secret",
  "searchBase": "dc=example,dc=com",
  "searchFilter": "(objectClass=*)" // optional
}
`)
);
