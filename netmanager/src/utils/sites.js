import { isEmpty } from "underscore";

const siteLabel = (name, description, generated_name) => {
  let label = `${name || description || generated_name}`;
  if (generated_name) label = `${label} (${generated_name})`;
  return label;
};

export const createSiteOptions = (sites) => {
  const siteOptions = [];
  sites.map(({ name, description, generated_name, ...rest }) => {
    siteOptions.push({
      label: siteLabel(name, description, generated_name),
      value: rest._id,
    });
  });
  return siteOptions;
};

export const filterSite = (sites, site_id) => {
  const currentSite = sites.filter((site) => site.value === site_id);
  if (isEmpty(currentSite)) {
    return { label: "", value: null };
  }
  return currentSite[0];
};
