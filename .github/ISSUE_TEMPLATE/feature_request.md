name: Feature Request
description: Suggest an idea for this project
title: "[FEATURE] "
labels: ["enhancement"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for your interest in improving KANS! Please describe your feature request.

  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      description: Describe the problem you're trying to solve
      placeholder: I'm always frustrated when...
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Describe the solution
      description: Clear description of what you want to happen
      placeholder: It would be great if...
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives considered
      description: Other solutions or features you've considered
      placeholder: Another option could be...

  - type: textarea
    id: context
    attributes:
      label: Additional context
      description: Any other context or mockups
      placeholder: Add screenshots or mockups here

  - type: checkboxes
    id: verification
    attributes:
      label: Verification
      options:
        - label: I searched existing issues and found no duplicates
          required: true
