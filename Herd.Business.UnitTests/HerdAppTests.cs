﻿using Herd.Business.ApiWrappers;
using Herd.Business.Models.Commands;
using Herd.Business.Models.Entities;
using Herd.Core;
using Herd.Data.Models;
using Herd.Data.Providers;
using Herd.Logging;
using Herd.UnitTestCore;
using Mastonet.Entities;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Herd.Business.UnitTests
{
    public class HerdAppTests
    {
        Mock<IDataProvider> _mockData = new Mock<IDataProvider>();
        Mock<IMastodonApiWrapper> _mockMastodonApiWrapper = new Mock<IMastodonApiWrapper>();
        Mock<ILogger> _mockLogger = new Mock<ILogger>();

        #region App Registration

        [Fact]
        public void GetRegistrationTest()
        {
            var expectedRegistration = new Registration
            {
                ID = 3,
                ClientId = "client-id",
                ClientSecret = "client-secret",
                Instance = "mastodon.instance",
                MastodonAppRegistrationID = "42"
            };

            _mockData.Setup(d => d.GetAppRegistration(3)).Returns(expectedRegistration);
            var herdApp = new HerdApp(_mockData.Object, _mockMastodonApiWrapper.Object, _mockLogger.Object);

            var result = herdApp.GetRegistration(new GetRegistrationCommand { ID = 3 });

            Assert.True(result?.Success);
            ExtendedAssert.ObjectsEqual(expectedRegistration, result.Data.Registration);
            _mockData.Verify(d => d.GetAppRegistration(3), Times.Once());
        }

        [Fact]
        public void GetOrCreateRegistrationWhenRegistrationDoesNotAlreadyExistTest()
        {
            _mockData.Setup(d => d.GetAppRegistration("mastodon.instance")).Returns(null as Registration);
            _mockMastodonApiWrapper.Setup(a => a.RegisterApp()).Returns(Task.FromResult(new Registration
            {
                ClientId = "client-id",
                ClientSecret = "client-secret",
                Instance = "mastodon.instance",
                MastodonAppRegistrationID = "42",
                ID = -1
            }));
            _mockData.Setup(d => d.CreateAppRegistration(It.Is<Registration>(r => r.Instance == "mastodon.instance")))
                .Returns<Registration>(registrationToCreate => registrationToCreate.With(r => r.ID = 3));

            var herdApp = new HerdApp(_mockData.Object, _mockMastodonApiWrapper.Object, _mockLogger.Object);

            var result = herdApp.GetOrCreateRegistration(new GetOrCreateRegistrationCommand { Instance = "mastodon.instance" });

            // Verify the result
            var expectedRegistration = new Registration
            {
                ID = 3,
                ClientId = "client-id",
                ClientSecret = "client-secret",
                Instance = "mastodon.instance",
                MastodonAppRegistrationID = "42"
            };

            Assert.True(result?.Success);
            ExtendedAssert.ObjectsEqual(expectedRegistration, result.Data.Registration);

            // Make sure the GetAppRegistration and CreateAppRegistration were each called exactly once
            _mockData.Verify(d => d.GetAppRegistration("mastodon.instance"), Times.Once());
            _mockMastodonApiWrapper.Verify(a => a.RegisterApp(), Times.Once());
            _mockData.Verify(d => d.CreateAppRegistration(It.Is<Registration>(r => r.Instance == "mastodon.instance")), Times.Once());
        }

        [Fact]
        public void GetOrCreateRegistrationWhenRegistrationAlreadyExistsTest()
        {
            var expectedRegistration = new Registration
            {
                ID = 3,
                ClientId = "client-id",
                ClientSecret = "client-secret",
                Instance = "mastodon.instance",
                MastodonAppRegistrationID = "42"
            };

            _mockData.Setup(d => d.GetAppRegistration("mastodon.instance")).Returns(expectedRegistration);
            var herdApp = new HerdApp(_mockData.Object, _mockMastodonApiWrapper.Object, _mockLogger.Object);

            var result = herdApp.GetOrCreateRegistration(new GetOrCreateRegistrationCommand { Instance = "mastodon.instance" });

            // Verify the result
            Assert.True(result?.Success);
            ExtendedAssert.ObjectsEqual(expectedRegistration, result.Data.Registration);

            // Make sure the GetAppRegistration was called once and CreateAppRegistration was never called
            _mockData.Verify(d => d.GetAppRegistration("mastodon.instance"), Times.Once());
            _mockData.Verify(d => d.CreateAppRegistration(It.Is<Registration>(r => true)), Times.Never());
        }

        [Fact]
        public void GetOAuthURLTest()
        {
            _mockData.Setup(d => d.GetAppRegistration(4)).Returns(new Registration
            {
                ID = 4,
                ClientId = "client-id",
                ClientSecret = "client-secret",
                Instance = "mastodon.instance",
                MastodonAppRegistrationID = "42"
            });
            _mockMastodonApiWrapper.Setup(p => p.GetOAuthUrl("https://SentURL")).Returns("https://ReturnedURL");

            var herdApp = new HerdApp(_mockData.Object, _mockMastodonApiWrapper.Object, _mockLogger.Object);

            var result = herdApp.GetOAuthURL(new GetOAuthURLCommand { AppRegistrationID = 4, ReturnURL = "https://SentURL" });

            Assert.True(result?.Success);
            Assert.Equal("https://ReturnedURL", result.Data?.URL);

            _mockData.Verify(d => d.GetAppRegistration(4), Times.Once());
            _mockMastodonApiWrapper.Verify(a => a.GetOAuthUrl("https://SentURL"), Times.Once());
        }

        #endregion

        #region Mastodon Users

        [Fact]
        public void FollowUserTest()
        {
            _mockMastodonApiWrapper.Setup(d => d.Follow("1", true))
                .Returns<string>(id => Task.FromResult(new MastodonRelationship { ID = id, Following = true }));

            var herdApp = new HerdApp(_mockData.Object, _mockMastodonApiWrapper.Object, _mockLogger.Object);

            var result = herdApp.FollowUser(new FollowUserCommand { UserID = "1", FollowUser = true });

            Assert.True(result?.Success);
            _mockMastodonApiWrapper.Verify(a => a.Follow("1", true), Times.Once());
        }

        [Fact]
        public void UnFollowUserTest()
        {
            _mockMastodonApiWrapper.Setup(d => d.Follow("1", false))
                .Returns<string>(id => Task.FromResult(new MastodonRelationship { ID = id, Following = false }));

            var herdApp = new HerdApp(_mockData.Object, _mockMastodonApiWrapper.Object, _mockLogger.Object);

            var result = herdApp.FollowUser(new FollowUserCommand { UserID = "1", FollowUser = false });

            Assert.True(result?.Success);
            _mockMastodonApiWrapper.Verify(a => a.Follow("1", false), Times.Once());
        }

        #endregion

        #region Mastodon Posts

        [Fact]
        public void CreateNewPostTest()
        {
            _mockMastodonApiWrapper.Setup(d => d.CreateNewPost("Hello World!", MastodonPostVisibility.Public,
                null, null, false, null)).Returns(Task.FromResult(new MastodonPost()));

            // Create the HerdApp using the mock objects
            var herdApp = new HerdApp(_mockData.Object, _mockMastodonApiWrapper.Object, _mockLogger.Object);

            // Run the HerdApp command (should execute the mock)
            var result = herdApp.CreateNewPost(new CreateNewPostCommand { Message = "Hello World!" });

            // Verify the result, do we need to check any more than this?
            //Assert.True(result?.Success);
        }

        #endregion
    }
}