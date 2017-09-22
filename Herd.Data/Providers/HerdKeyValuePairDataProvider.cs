﻿using Herd.Core;
using Herd.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Herd.Data.Providers
{
    public abstract class HerdKeyValuePairDataProvider : IHerdDataProvider
    {
        private static object _nexIdLock = new object();

        protected string KeyRoot { get; private set; }
        protected string KeyDelimiter { get; private set; }

        protected HerdKeyValuePairDataProvider(string keyRoot, string keyDelimiter)
        {
            KeyRoot = keyRoot;
            KeyDelimiter = keyDelimiter;
        }

        #region AppRegistration

        public HerdAppRegistrationDataModel GetAppRegistration(long id) => GetEntity<HerdAppRegistrationDataModel>(id);
        public HerdAppRegistrationDataModel GetAppRegistration(string instance) => GetEntity<HerdAppRegistrationDataModel>(r => r.Instance == instance);
        public HerdAppRegistrationDataModel CreateAppRegistration(HerdAppRegistrationDataModel appRegistration) => CreateEntity(appRegistration);
        public void UpdateAppRegistration(HerdAppRegistrationDataModel appRegistration) => UpdateEntity(appRegistration);

        #endregion AppRegistration

        #region Users

        public HerdUserAccountDataModel GetUser(long id) => GetEntity<HerdUserAccountDataModel>(id);
        public HerdUserAccountDataModel GetUser(string email) => GetEntity<HerdUserAccountDataModel>(u => u.Email == email);
        public HerdUserAccountDataModel CreateUser(HerdUserAccountDataModel user) => CreateEntity(user);
        public void UpdateUser(HerdUserAccountDataModel user) => UpdateEntity(user);

        #endregion Users

        #region Profiles

        public HerdUserProfileDataModel GetProfile(long id) => GetEntity<HerdUserProfileDataModel>(id);
        public HerdUserProfileDataModel CreateProfile(HerdUserProfileDataModel profile) => CreateEntity(profile);
        public void UpdateProfile(HerdUserProfileDataModel profile) => UpdateEntity(profile);

        #endregion

        #region Abstract overrides

        protected abstract IEnumerable<string> GetAllKeys(string rootKey);
        protected abstract string ReadKey(string key);
        protected abstract void WriteKey(string key, string value);

        #endregion Abstract overrides

        #region Private helpers

        private T GetEntity<T>(Func<T, bool> matches) where T : HerdDataModel
        {
            return GetAllEntities<T>().FirstOrDefault(matches);
        }

        private IEnumerable<T> GetAllEntities<T>() where T : HerdDataModel
        {
            var entityRootKey = BuildEntityRootKey<T>();
            return GetAllKeys(entityRootKey)
                .Where(key => long.TryParse(key.Split(KeyDelimiter).Last(), out _))
                .Select(key => GetEntity<T>(key));
        }

        private T GetEntity<T>(long id) where T : HerdDataModel
        {
            return GetEntity<T>(BuildEntityKey<T>(id));
        }

        private T GetEntity<T>(string key) where T : HerdDataModel
        {
            try
            {
                return ReadKey(key).ParseJson<T>();
            }
            catch
            {
                // Not found.
                return null;
            }
        }

        private T CreateEntity<T>(T entity) where T : HerdDataModel
        {
            lock (_nexIdLock)
            {
                var nextIdKey = BuildNextIdKey<T>();
                string nextIdVal = null;
                try { nextIdVal = ReadKey(nextIdKey); } catch { }
                if (string.IsNullOrWhiteSpace(nextIdVal))
                {
                    nextIdVal = ((long)1).SerializeAsJson(true);
                }
                entity.ID = nextIdVal.ParseJson<long>();
                WriteKey(nextIdKey, (entity.ID + 1).SerializeAsJson(true));
            }
            UpdateEntity(entity);
            return entity;
        }

        private void UpdateEntity<T>(T entity) where T : HerdDataModel
        {
            WriteKey(BuildEntityKey<T>(entity.ID), entity.SerializeAsJson(true));
        }

        private string BuildEntityKey<T>(long id) where T : HerdDataModel
        {
            return string.Join(KeyDelimiter, BuildEntityRootKey<T>(), id);
        }

        private string BuildEntityRootKey<T>() where T : HerdDataModel
        {
            return string.Join(KeyDelimiter, KeyRoot, typeof(T).GetEntityName());
        }

        private string BuildNextIdKey<T>()
        {
            return string.Join(KeyDelimiter, KeyRoot, typeof(T).GetEntityName(), "NextID");
        }

        #endregion Private helpers
    }
}