# General Notes

- Deletion endpoints return *success* if the entity did not exist in the first place
  - This is documented also in the openapi documentation.
  - However, these endpoints *also* return the basic details of the deleted entity - this will be empty if the entity did not exist.
  - So if you see a `200` response, no errors, and no "deleted entity details", then you can conclude the entity did not exist. Which you may wish to flag to the user.
  - CERBERUS UI does not do this, however. It allows the non-existent-entity case to pass silently.
  - Since if you're deleting it, you didn't want it there anyway, so no worries.