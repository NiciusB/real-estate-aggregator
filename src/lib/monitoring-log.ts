/* eslint-disable no-unused-vars */
export enum SEVERITY {
  Error,
  Warning,
  Debug,
}
/* eslint-enable no-unused-vars */

export async function logMessage(err: string | Error, severity: SEVERITY, context: any = '') {
  if (process.env.NODE_ENV === 'prod' && severity === SEVERITY.Debug) {
    return
  }

  const message = typeof err === 'string' ? err : err.message
  const stack = typeof err === 'string' ? '' : err.stack
  switch (severity) {
    case SEVERITY.Error: {
      console.error(message, stack, context)
      break
    }
    case SEVERITY.Warning: {
      console.warn(message, stack, context)
      break
    }
    case SEVERITY.Debug: {
      console.debug(message, stack, context)
      break
    }
    default:
      throw new Error('Unknown type')
  }
}
