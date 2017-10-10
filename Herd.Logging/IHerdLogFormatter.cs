﻿using System;
using System.Collections.Generic;
using System.Text;

namespace Herd.Logging
{
    public interface IHerdLogFormatter
    {
        string GetLogLine(Guid? id, HerdLogLevel logLevel, string message, IEnumerable<KeyValuePair<string, string>> contextParameters = null);
    }
}