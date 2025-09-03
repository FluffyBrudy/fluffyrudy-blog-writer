interface ITagStatus {
  valid: Array<string>;
  invalid: Array<string>;
}

export function createSlug(title: string) {
  const filteredTitle = title.replace(/[^a-zA-Z0-9\s-]/g, "");
  const slug = filteredTitle.replace(/\s/g, "-");
  return slug;
}

export function validateTag(tag: string) {
  return tag.match(/[a-z]+(?:-[a-z0-9]+)*/);
}

export function validateTags(tags: Array<string>) {
  const tagsStatus: ITagStatus = {
    valid: [],
    invalid: [],
  };
  tags.forEach((tag) => {
    if (validateTag(tag)) tagsStatus.valid.push(tag);
    else tagsStatus.invalid.push(tag);
  });
  return tagsStatus;
}
