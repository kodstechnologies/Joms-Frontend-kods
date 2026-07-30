/**
 * TEMP static test users for chat — delete when real user auth exists.
 * Tokens from: chat-service `pnpm mint-static-users`
 */
export type StaticChatUser = {
  id: string
  username: string
  accessToken: string
}

export const STATIC_CHAT_USERS: StaticChatUser[] = [
  {
    id: 'aa9d814f-8d63-43ed-8a65-fb56ed06bbb8',
    username: 'usertest111',
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFhOWQ4MTRmLThkNjMtNDNlZC04YTY1LWZiNTZlZDA2YmJiOCIsInVzZXJUeXBlIjoidXNlciIsIm5hbWUiOiJ1c2VydGVzdDExMSIsImlhdCI6MTc4NTM5MzYyMCwiZXhwIjoxODE2OTI5NjIwfQ.J1pMHuZmGVWGEtQFAlFuKfsiVmb95NVo0uhveQvvURY',
  },
  {
    id: 'e1700e23-1970-4d9b-b3ea-31d00bb9a19b',
    username: 'usertest222',
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUxNzAwZTIzLTE5NzAtNGQ5Yi1iM2VhLTMxZDAwYmI5YTE5YiIsInVzZXJUeXBlIjoidXNlciIsIm5hbWUiOiJ1c2VydGVzdDIyMiIsImlhdCI6MTc4NTM5MzYyMCwiZXhwIjoxODE2OTI5NjIwfQ.WuvQHLX2Qp5wG4F7NIl7EuAQV8i-STZC8-QrEbkKHNU',
  },
  {
    id: '01c6875d-4a99-4a30-b3ac-3eec537bc7f2',
    username: 'usertest333',
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxYzY4NzVkLTRhOTktNGEzMC1iM2FjLTNlZWM1MzdiYzdmMiIsInVzZXJUeXBlIjoidXNlciIsIm5hbWUiOiJ1c2VydGVzdDMzMyIsImlhdCI6MTc4NTM5MzYyMCwiZXhwIjoxODE2OTI5NjIwfQ.A14FLnxfSkp8C3TCaIBxAre8RlGUpUtd3Ca4AhWzQsQ',
  },
  {
    id: '776c815a-02ce-4f18-a894-fe1e0adf060f',
    username: 'usertest444',
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc3NmM4MTVhLTAyY2UtNGYxOC1hODk0LWZlMWUwYWRmMDYwZiIsInVzZXJUeXBlIjoidXNlciIsIm5hbWUiOiJ1c2VydGVzdDQ0NCIsImlhdCI6MTc4NTM5MzYyMCwiZXhwIjoxODE2OTI5NjIwfQ.mgXXRTkDEafkqzXXXacdHk2DNNWEBg_JqYeqQhV2Xfk',
  },
  {
    id: '87201e92-5c12-45d6-9f3a-55fdc014ba5c',
    username: 'usertest555',
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg3MjAxZTkyLTVjMTItNDVkNi05ZjNhLTU1ZmRjMDE0YmE1YyIsInVzZXJUeXBlIjoidXNlciIsIm5hbWUiOiJ1c2VydGVzdDU1NSIsImlhdCI6MTc4NTM5MzYyMCwiZXhwIjoxODE2OTI5NjIwfQ.NL8ciWXLmpRagcKEjmIg-l7cTZ3vtZQokrW9fomFoIk',
  },
]
