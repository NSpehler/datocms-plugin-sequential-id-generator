import React, { useState } from 'react';
import { SiteClient } from 'datocms-client';
import PropTypes from 'prop-types';

import connectToDatoCms from './connectToDatoCms';
import './style.sass';

const Main = ({
  plugin,
  datoCmsApiToken,
  idPrefix,
  minLength = 0,
}) => {
  const [loading, setLoading] = useState(false);

  const generate = () => {
    setLoading(true);

    const client = new SiteClient(datoCmsApiToken);
    const ids = [];

    // Get model ID
    client.itemTypes.find(plugin.itemType.attributes.api_key)
      .then((itemType) => {
        // Get list of IDs
        client.items.all({
          'filter[type]': itemType.id,
        }, {
          allPages: true,
        })
          .then((items) => {
            items.forEach((item) => {
              ids.push(item[plugin.field.attributes.api_key]);
            });

            let i = 1;
            let id = '';

            for (;;) {
              id = idPrefix + i.toString().padStart(minLength, '0');

              if (!ids.includes(id)) {
                break;
              }

              i += 1;
            }

            // Set field value
            plugin.setFieldValue(plugin.fieldPath, id);
            plugin.notice(`${plugin.field.attributes.label} generated successfully.`);
            setLoading(false);
          })
          .catch((error) => {
            console.error(error);
            plugin.notice('An error has occured, please try again.');
            setLoading(false);
          });
      })
      .catch((error) => {
        console.error(error);
        plugin.notice('An error has occured, please try again.');
        setLoading(false);
      });
  };

  return (
    loading ? (
      <p className="loading">Loading...</p>
    ) : (
      <a href="#generate" className="button" onClick={() => generate()}>
        Generate
        {' '}
        {plugin.field.attributes.label.toLowerCase()}
      </a>
    )
  );
};

const Wrap = connectToDatoCms(plugin => ({
  plugin,
  datoCmsApiToken: plugin.parameters.global.datoCmsApiToken,
  idPrefix: plugin.parameters.instance.idPrefix,
  minLength: plugin.parameters.instance.minLength,
}))(Main);

Main.propTypes = {
  plugin: PropTypes.object.isRequired,
  datoCmsApiToken: PropTypes.string.isRequired,
  idPrefix: PropTypes.string,
  minLength: PropTypes.number,
};

export default Wrap;
