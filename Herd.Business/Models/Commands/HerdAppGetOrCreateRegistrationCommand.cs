﻿using System;
using System.Collections.Generic;
using System.Text;

namespace Herd.Business.Models.Commands
{
    public class HerdAppGetOrCreateRegistrationCommand : HerdAppCommand
    {
        public string Instance { get; set; }
    }
}