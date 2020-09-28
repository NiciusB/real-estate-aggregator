/* eslint-disable no-unused-vars */
export enum SEVERITY {
  Error,
  Warning,
  Debug,
}
/* eslint-enable no-unused-vars */

export async function logMessage(message: string | Error, severity: SEVERITY, context: any = '') {
  switch (severity) {
    case SEVERITY.Error: {
      console.error(message, context)
      break
    }
    case SEVERITY.Warning: {
      console.warn(message, context)
      break
    }
    case SEVERITY.Debug: {
      console.debug(message, context)
      break
    }
    default:
      throw new Error('Unknown type')
  }
  console.log('') // spacing line
}
