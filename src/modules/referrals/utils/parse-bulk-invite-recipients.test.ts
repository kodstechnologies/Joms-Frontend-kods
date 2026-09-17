import { describe, expect, it } from 'vitest'

import { parseCsvRecipients } from './parse-bulk-invite-recipients'

describe('parseCsvRecipients', () => {
  it('parses a headered template with two experts', () => {
    const csv = [
      'name,email,phone',
      'Jane Doe,jane@example.com,9876543210',
      'John Smith,john@example.com,9876543211',
    ].join('\n')

    expect(parseCsvRecipients(csv)).toEqual([
      { name: 'Jane Doe', email: 'jane@example.com', phone: '9876543210' },
      { name: 'John Smith', email: 'john@example.com', phone: '9876543211' },
    ])
  })

  it('does not treat the first expert as a header row', () => {
    const csv = [
      'Namrata,namrata@gmail.com,9876543210',
      'Ankit Sharma,ankit@gmail.com,9876543211',
    ].join('\n')

    expect(parseCsvRecipients(csv)).toEqual([
      { name: 'Namrata', email: 'namrata@gmail.com', phone: '9876543210' },
      { name: 'Ankit Sharma', email: 'ankit@gmail.com', phone: '9876543211' },
    ])
  })

  it('recovers a name that contains an unquoted comma', () => {
    const csv = [
      'name,email,phone',
      'Sharma, Rajesh,rajesh@example.com,9876543210',
      'Ankit Kumar,ankit@example.com,9876543211',
    ].join('\n')

    expect(parseCsvRecipients(csv)).toEqual([
      { name: 'Sharma, Rajesh', email: 'rajesh@example.com', phone: '9876543210' },
      { name: 'Ankit Kumar', email: 'ankit@example.com', phone: '9876543211' },
    ])
  })

  it('normalizes +91 and leading-zero phone numbers', () => {
    const csv = [
      'name,email,phone',
      'First Expert,first@example.com,+91 98765 43210',
      'Second Expert,second@example.com,09876543211',
    ].join('\n')

    expect(parseCsvRecipients(csv)).toEqual([
      { name: 'First Expert', email: 'first@example.com', phone: '9876543210' },
      { name: 'Second Expert', email: 'second@example.com', phone: '9876543211' },
    ])
  })

  it('keeps only the first row when three experts share the same email', () => {
    const csv = [
      'name,email,phone',
      'sagar,kodsdev1@example.com,9876543210',
      'harsha,kodsdev1@example.com,9876543211',
      'hello,kodsdev1@example.com,9876543212',
    ].join('\n')

    expect(parseCsvRecipients(csv)).toEqual([
      { name: 'sagar', email: 'kodsdev1@example.com', phone: '9876543210' },
    ])
  })

  it('reads Excel text-formula phones from the CSV template', () => {
    const csv = [
      'name,email,phone',
      'Jane Doe,jane@example.com,="9876543210"',
      'John Smith,john@example.com,="9876543211"',
    ].join('\n')

    expect(parseCsvRecipients(csv)).toEqual([
      { name: 'Jane Doe', email: 'jane@example.com', phone: '9876543210' },
      { name: 'John Smith', email: 'john@example.com', phone: '9876543211' },
    ])
  })

  it('keeps Excel scientific phones like 9.87E+09 so all unique emails are invited', () => {
    const csv = [
      'name,email,phone',
      'sagar,sagar@example.com,9.87E+09',
      'harsha,harsha@example.com,9.87E+09',
      'hello,hello@example.com,9.87E+09',
    ].join('\n')

    expect(parseCsvRecipients(csv)).toEqual([
      { name: 'sagar', email: 'sagar@example.com', phone: '9870000000' },
      { name: 'harsha', email: 'harsha@example.com', phone: '9870000000' },
      { name: 'hello', email: 'hello@example.com', phone: '9870000000' },
    ])
  })
})
