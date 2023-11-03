import { Logger } from "@ironfish/sdk";
import consola, { ConsolaReporterLogObject, LogLevel, logType } from "consola";
import log from "electron-log";

const logPrefix = "[node]";

export const loggers: Record<logType, typeof log.log> = {
  fatal: log.error,
  error: log.error,
  warn: log.warn,
  log: log.log,
  info: log.info,
  success: log.info,
  debug: log.debug,
  trace: log.debug,
  verbose: log.verbose,
  ready: log.info,
  start: log.info,
  silent: (): null => null,
};

class IronFishElectronLogger {
  log(logObj: ConsolaReporterLogObject) {
    const logger = loggers[logObj.type];
    logger(logPrefix, ...logObj.args);
  }
}

const ironFishElectronLoggerInstance = new IronFishElectronLogger();

const createAppLogger = (): Logger => {
  return consola.create({
    reporters: [ironFishElectronLoggerInstance],
    level: LogLevel.Info,
  });
};

export const logger = createAppLogger();
