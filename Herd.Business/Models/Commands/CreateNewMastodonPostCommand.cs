﻿using Herd.Business.Models.Entities;
using System.Collections.Generic;
using System.IO;

namespace Herd.Business.Models.Commands
{
    public class CreateNewMastodonPostCommand : Command
    {
        public string Message { get; set; }
        public MastodonPostVisibility Visibility { get; set; }
        public string ReplyStatusId { get; set; }
        public bool Sensitive { get; set; }
        public string SpoilerText { get; set; }
        public Stream Attachment { get; set; }

        public bool HasAttachment => Attachment?.Length > 0;
    }
}