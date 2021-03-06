﻿using Herd.Data.Models;
using Xunit;

namespace Herd.Data.UnitTests
{
    public class KeyValuePairDataProviderTests
    {
        private MockKeyValuePairDataProvider _data = new MockKeyValuePairDataProvider();

        #region App registration

        [Fact]
        public void TestCreateGetAppRegistrationByID()
        {
            var appRegistration = _data.CreateAppRegistration(new Registration());
            Assert.Equal(appRegistration.ID, _data.GetAppRegistration(appRegistration.ID).ID);
        }

        [Fact]
        public void TestCreateGetAppRegistrationByInstance()
        {
            var appRegistration = _data.CreateAppRegistration(new Registration { Instance = "mastodon.xyz" });
            Assert.Equal(appRegistration.ID, _data.GetAppRegistration("mastodon.xyz").ID);
        }

        [Fact]
        public void TestCreateUpdateApRegistration()
        {
            var appRegistration = _data.CreateAppRegistration(new Registration());
            appRegistration.Instance = "mastodon.social";
            _data.UpdateAppRegistration(appRegistration);
            Assert.Equal("mastodon.social", _data.GetAppRegistration(appRegistration.ID).Instance);
        }

        #endregion App registration

        // TODO: Write for all methods in IHerdDataProvider
    }
}